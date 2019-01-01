import React, { Component } from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';

export default class SearchItem extends Component {
  static propTypes = {
    item: propTypes.object.isRequired,
    isSelect: propTypes.bool
  }

  static defaultProps = {
    item: undefined,
    isSelect: false
  }

  render() {
    const { item, isSelect } = this.props;

    return (
      <a 
        href={`/store/${item.slug}`} 
        className={classnames('search__result', isSelect && 'search__result--active')}
      >
        <strong>{item.name}</strong>
      </a>
    );
  }
}
