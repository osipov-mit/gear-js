import { HeaderCol } from 'components/common/Table';

import codeSVG from 'assets/images/table/code_icon.svg';
import menuSVG from 'assets/images/table/menu_icon.svg';
import timestampSVG from 'assets/images/table/timestamp_icon.svg';

export const TABLE_COLS = [1.5, 1, 1];

export const TABLE_HEADER: HeaderCol[] = [
  {
    icon: codeSVG,
    text: 'Program name',
  },
  {
    icon: timestampSVG,
    text: 'Timestamp',
  },
  {
    icon: menuSVG,
    text: 'Send message / Upload metadata',
    align: 'right',
  },
];
