<template>
  <div class="list-container">
    <h2 class="section-title">{{ title }}</h2>
    <div class="list">
      <article class="entity" v-on:click="$emit('onSelect', entity.isin)" v-for="entity in entities" :key="entity.isin">
        <div class="information">
          <p class="title" v-html="entity.title">
          </p>
          <p class="isin">{{ entity.isin }}</p>
        </div>
        <div class="price" v-if="showPrice">
          <p class="price-text">{{ entity.price | price }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: 'List',
  props: {
    title: String,
    entities: Array,
    showPrice: Boolean
  },
  filters: {
    price: function(value) {
      if (!value) return '';
      return `${value.toFixed(2)}€`;
    }
  }
}
</script>

<style scoped>
  .section-title {
    font-size: 1.6rem;
  }

  .list {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .entity {
    width: 100%;
    margin-bottom: 32px;
    border: 1px solid #e8e9ec;
    border-radius: 2px;
    box-shadow: 0 0 2px rgba(0,0,0,.2);
    padding: 10px 20px;
    cursor: pointer;
    transition: box-shadow .2s ease-in-out;
    display: flex;
    margin-right: 10px;
  }

  .entity:hover {
    box-shadow: 0 0 8px rgba(0,0,0,.35);
  }

  .information {
    flex-basis: 66%;
  }

  .price {
    text-align: right;
    flex-grow: 1;
  }

  p {
    margin: 0;
  }

  .title {
    font-size: 1rem;
  }

  .isin {
    font-size: .8rem;
    color: #4f6d6b;
  }

  .price-text {
    font-size: 1rem;
  }

  @media (min-width: 768px) {
    .list {
      margin: 0 -6px;
    }
    .entity {
      width: 50%;
    }
  }
  @media (min-width: 1024px) {
    /* hack for aligning last row in flex, it occurs only when number of elements in row more than 2 */
    .list::after {
      content: "";
      flex: auto;
    }
    .entity {
      width: 32%;
    }
  }
</style>
