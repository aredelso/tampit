import moment from 'moment';
import 'moment-duration-format';

export function formatBrewTime(time: number): string {
  return (moment.duration(time, 's') as any).format('h[h] m[m] s[s]', {
    trim: 'both',
  });
}
