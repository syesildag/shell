import '../styles/global.css';
import 'reflect-metadata';

import { AppProps } from 'next/app';
import React from 'react';

import logger from '../lib/src/utils/logger';

export default class App extends React.Component<AppProps> {

  constructor(props) {
    super(props);
  }

  render() {
    let { Component, pageProps, router } = this.props;
    logger.debug("app parameters: " + JSON.stringify([Component, pageProps, router]));
    return <Component {...pageProps} />;
  }
}