import { combineReducers } from 'redux'
import BrandVideoList from './VideoList';
import ChosenBrandVideo from './VideoChoose';
import SelectBrandVideo from './VideoSelect';
import VideoFilter from './VideoFilter';

export default combineReducers({
  BrandVideoList,
  ChosenBrandVideo,
  SelectBrandVideo,
  VideoFilter
});