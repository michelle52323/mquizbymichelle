import React from 'react';

import dragHandleIcon from '../../../assets/icons/drag-handle-svgrepo-com.svg?raw';
import homeIcon from '../../../assets/icons/home-1.svg?raw';
import eyeIcon from '../../../assets/icons/eye.svg?raw';
import leftArrowIcon from '../../../assets/icons/left-arrow-svgrepo-com.svg?raw';
import rightArrowIcon from '../../../assets/icons/right-arrow-svgrepo-com.svg?raw';
import errorIcon from '../../../assets/icons/namur-failure-filled-svgrepo-com.svg?raw';
import pencilIcon from '../../../assets/icons/pencil-svgrepo-com.svg?raw';
import addIcon from '../../../assets/icons/plus-lg.svg?raw';
import printIcon from '../../../assets/icons/print-svgrepo-com.svg?raw';
import saveIcon from '../../../assets/icons/save-icon-silhouette-svgrepo-com.svg?raw';
import successIcon from '../../../assets/icons/success-standard-filled-svgrepo-com.svg?raw';
import deleteIcon from '../../../assets/icons/trash.svg?raw';
import menuIcon from '../../../assets/icons/menu-svgrepo-com.svg?raw';
import bulletListIcon from '../../../assets/icons/bullet-list-svgrepo-com.svg?raw'
import orderedListIcon from '../../../assets/icons/numbered-list-svgrepo-com.svg?raw'
import chevronUpIcon from '../../../assets/icons/collapse-svgrepo-com.svg?raw'
import chevronDownIcon from '../../../assets/icons/down-chevron-svgrepo-com.svg?raw'
import warningIcon from '../../../assets/icons/warning-svgrepo-com.svg?raw'
import reviewIcon from '../../../assets/icons/review-screen-svgrepo-com.svg?raw'
import answerSelectedIcon from '../../../assets/icons/answer-selected.svg?raw'



const iconMap: Record<string, string> = {
  drag: dragHandleIcon,
  home: homeIcon,
  eye: eyeIcon,
  leftArrow: leftArrowIcon,
  rightArrow: rightArrowIcon,
  error: errorIcon,
  pencil: pencilIcon,
  add: addIcon,
  print: printIcon,
  save: saveIcon,
  success: successIcon,
  delete: deleteIcon,
  menu: menuIcon,
  bulletList: bulletListIcon,
  orderedList: orderedListIcon,
  chevronUp: chevronUpIcon,
  chevronDown: chevronDownIcon,
  warning: warningIcon,
  review: reviewIcon,
  answerSelected: answerSelectedIcon
};

const defaultClassMap: Partial<Record<keyof typeof iconMap, string>> = {
  pencil: 'button-icon-edit',
  eye: 'button-icon-view',
  delete: 'button-icon-delete',
  save: 'button-icon-save',
  rightArrow: "button-icon-right-arrow",
  leftArrow: "button-icon-left-arrow",
  chevronUp: "button-icon-chevron-up",
  review: "button-icon-review"
};

interface IconProps {
  name: keyof typeof iconMap;
  width?: number;
  height?: number;
  className?: string;
}


const Icon: React.FC<IconProps> = ({ name, width = 24, height = 24, className }) => {
  const svgMarkup = iconMap[name];
  if (!svgMarkup) return null;

  const defaultClass = defaultClassMap[name] ?? '';
  const combinedClassName = [defaultClass, className].filter(Boolean).join(' ');

  return (
    <div
      className={combinedClassName}
      style={{ width, height }}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
      aria-hidden="true"
    />
  );
};

export default Icon;