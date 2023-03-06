import index from './index.vue';

index.install = (Vue)=> {
  Vue.component(index.name, index);
};
export default index;
