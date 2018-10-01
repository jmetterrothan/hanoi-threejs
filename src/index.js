import 'reset-css';
import './assets/sass/style.scss';

import Hanoi from './Hanoi';

const hanoi = new Hanoi();

hanoi.init();
hanoi.load(3);
hanoi.render();
