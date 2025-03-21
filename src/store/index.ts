/**
 * @desc: 有些场景下，想在非 UI 组件内使用 atom，这时需要一个额外的 store，参考 https://jotai.org/docs/core/store
 */
import { createStore } from 'jotai';

const store = createStore();

export default store;
