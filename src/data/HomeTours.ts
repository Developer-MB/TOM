import initialTours from '../../data/post-tours.json';
import type { CmsTourItem } from './CmsTypes';

export type HomeTour = CmsTourItem;

export const INITIAL_CMS_TOURS = initialTours as CmsTourItem[];
export const UPCOMING_TOURS: HomeTour[] = INITIAL_CMS_TOURS
    .filter((tour) => tour.status === 'PUBLICADO')
    .sort((first, second) => getTourTimestamp(first) - getTourTimestamp(second));

const monthNames = [
    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
];

export const formatTourMonth = (month: string) => {
    const monthIndex = Number(month) - 1;
    return Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex < monthNames.length
        ? monthNames[monthIndex]
        : month.toLocaleUpperCase('es');
};

export function getTourTimestamp(tour: Pick<CmsTourItem, 'year' | 'month' | 'day'>) {
    const year = Number(tour.year);
    const month = Number(tour.month);
    const day = Number(tour.day);
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return 0;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
        ? date.getTime()
        : 0;
}
