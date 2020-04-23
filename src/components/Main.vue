<template>
    <main class="container">
        <section class="header">
            <SearchForm v-model="input"></SearchForm>
        </section>
        <section class="content">
            <Loader v-if="search.isLoading"></Loader>
            <p v-else-if="search.isSearchFailed" class="no-results">
                Unfortunately there are currently no stocks/etfs by your query, but check
                what else we have for you!
            </p>
            <div v-else-if="search.results.length !== 0">
                <List :title="`Search results for ${search.query}`"
                      :entities="search.results.map(isin => entities[isin])"
                      @onSelect="addToWatchlist" />
            </div>
            <List v-if="Object.keys(watchlist).length !== 0"
                  title="Watchlist"
                  :show-price="true"
                  :entities="Object.keys(watchlist).map(isin => entities[isin])"
                  @onSelect="removeFromWatchlist" />
            <List title="Hot stocks"
                  :entities="stocks.map(isin => entities[isin])"
                  @onSelect="addToWatchlist" />
            <List title="Hot ETFs"
                  :entities="etfs.map(isin => entities[isin])"
                  @onSelect="addToWatchlist" />
        </section>
    </main>
</template>

<script>
  import debounce from 'lodash/debounce'
  import Fuse from 'fuse.js'

  import Socket from '../libs/socket';

  import List from './List.vue'
  import SearchForm from './SearchForm.vue'
  import Loader from './Loader';

  import data from '../assets/data.json'

  export default {
    name: 'Main',
    components: {
      List,
      SearchForm,
      Loader
    },
    data() {
      return {
        input: '',
        search: {
          query: '',
          isLoading: false,
          isSearchFailed: false,
          results: [],
        },
        isWSConnected: false,
        isInBackground: false,
        entities: {},
        stocks: [],
        etfs: [],
        // mimic Set in order to be reactive and efficient
        watchlist: {},
      }
    },
    methods: {
      addToWatchlist(isin) {
        if (this.watchlist[isin]) return;

        this.$set(this.watchlist, isin, true);
        this.ws.send(JSON.stringify({subscribe: isin}));
        this.sync();
      },
      removeFromWatchlist(isin) {
        this.$delete(this.watchlist, isin);
        this.ws.send(JSON.stringify({unsubscribe: isin}));
        this.sync();
      },
      sync() {
        localStorage.setItem('watchlist', JSON.stringify(Object.keys(this.watchlist)));
      }
    },
    watch: {
      input: debounce(function (value) {
        this.search.query = value
        this.search.isSearchFailed = false
        if (value.length < 3) {
          this.search.results = []
          return
        }
        this.search.isLoading = true
        // simulate async search
        setTimeout(() => {
          // do not touch state if user types something while we were awaiting
          // response for prev query
          if (this.input !== value) return

          this.search.isLoading = false
          this.search.results = this.fuse.search(value).map(i => i.item.isin)
          if (this.search.results.length === 0) {
            this.search.isSearchFailed = true
          }
        }, 600)
      }, 300)
    },
    created() {
      this.ws = new Socket();
      this.ws.on('connect', () => this.isWSConnected = true);
      this.ws.on('disconnect', () => this.isWSConnected = false);
      this.ws.on('message', message => {
        if (this.isInBackground) return;
        const {isin, price} = message;
        this.$set(this.entities[isin], 'price', price);
      });

      const options = {
        shouldSort: true,
        minMatchCharLength: 3,
        threshold: 0.4,
        keys: ['title', 'isin'],
      }

      this.fuse = new Fuse([...data.stocks, ...data.etfs], options)

      for (const stock of data.stocks) {
        this.$set(this.entities, stock.isin, stock);
        this.stocks.push(stock.isin);
      }

      for (const etf of data.etfs) {
        this.$set(this.entities, etf.isin, etf);
        this.etfs.push(etf.isin);
      }

      try {
        const watchlist = JSON.parse(localStorage.getItem('watchlist'));
        watchlist.forEach(isin => {
          this.$set(this.watchlist, isin, true);
          this.ws.send(JSON.stringify({subscribe: isin}));
        });
      } catch(err) {
        console.warn('Unable to parse "watchlist" entity', err);
        localStorage.removeItem('watchlist');
      }
    },
    mounted() {
      document.addEventListener('visibilitychange', () => {
        this.isInBackground = document.visibilityState !== 'visible';
      });
    }
  }
</script>

<style scoped>
    .container {
        min-height: 100vh;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
    }
    .header {
        padding: 16px;
    }
    .content {
        display: flex;
        flex: 1;
        flex-direction: column;
        margin-top: 10px;
        padding: 0 16px;
    }
</style>
