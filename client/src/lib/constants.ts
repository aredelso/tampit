import {
  pouroverIcon,
  aeropressIcon,
  espressoIcon,
  dripIcon,
  coldbrewIcon,
  rapidBrewerIcon,
  frenchPressIcon,
  mokaIcon,
} from '../../public';

/**
 * Brew method icons mapping
 */
export const BREW_ICONS: Record<string, string> = {
  PourOver: pouroverIcon.src,
  Espresso: espressoIcon.src,
  FrenchPress: frenchPressIcon.src,
  Drip: dripIcon.src,
  AeroPress: aeropressIcon.src,
  ColdBrew: coldbrewIcon.src,
  RapidBrewer: rapidBrewerIcon.src,
  Moka: mokaIcon.src,
};

/**
 * All supported brew methods to populate UI dropdowns and validate user input
 */
export const BREW_METHODS = [
  'PourOver',
  'Espresso',
  'FrenchPress',
  'Drip',
  'AeroPress',
  'ColdBrew',
  'RapidBrewer',
  'Moka',
];
