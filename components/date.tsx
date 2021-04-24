import { format, parseISO } from 'date-fns';
import React from 'react';

export interface DateProps {
  dateString: string
}

export default class Date extends React.Component<DateProps> {

  constructor(props) {
    super(props);
  }

  render() {
    const { dateString } = this.props;
    const date = parseISO(dateString);
    return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>;
  }
}