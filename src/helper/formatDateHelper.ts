import * as Handlebars from 'handlebars';
import { format } from 'date-fns';

// Register the custom helper
Handlebars.registerHelper('formatDate', (date: Date) => {
  return format(date, 'yyyy-MM-dd');
});