import { loadSound } from './Audio';

const assets = [
  'audio/test.mp3',
  'audio/test2.mp3',
  'audio/click.mp3'
]

let allAssets = assets.map(loadSound);

export default Promise.all(allAssets);
