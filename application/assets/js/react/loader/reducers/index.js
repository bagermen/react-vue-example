import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import Brand from './Brand';
import BrandVideo from './BrandVideo';
import Timezone from './Timezone';
import Category from './Category';
import Models from './Models';
import Host from './Host';

export default (history) => combineReducers({
  Timezone,
  Category,
  Host,
  Brand,
  BrandVideo,
  Models,
  router: connectRouter(history)
})
