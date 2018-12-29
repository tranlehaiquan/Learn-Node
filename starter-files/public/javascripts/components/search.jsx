import React, {Fragment} from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import SearchItem from './SearchItem.jsx';

class Search extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      keyword: '',
      stores: [],
      indexActive: -1
    };

    this.getStore = debounce(this.getStore, 300);
  }

  getStore = async () => {
    const { keyword } = this.state;

    try {
      const {data: stores} = await axios.get(`/search?q=${keyword}`);

      this.setState(() => ({
        stores
      }));
    } catch(err) {
      alert('error you dumb!');
    }
  }

  onChange = (e) => {
    this.setState({
      keyword: e.target.value,
      indexActive: -1
    });

    this.getStore();
  }

  handleKeyUp = (e) => {
    const { key } = e;
    const { indexActive, stores } = this.state;

    if( key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Enter') return;
    e.preventDefault();

    if( key === 'ArrowUp' ) {
      if( indexActive < 0 ) return;

      this.setState(() => ({
        indexActive: indexActive - 1
      }));
    }

    if( key === 'ArrowDown' ) {
      if( indexActive >= stores.length - 1 || !stores.length ) return;

      this.setState(() => ({
        indexActive: indexActive + 1
      }));
    }

    if( key === 'Enter' ) {
      if( indexActive < 0) return;
      const { slug } = stores[indexActive];

      window.location.pathname = `/store/${slug}`;
    }
  }

  render() {
    const { keyword, stores, indexActive } = this.state;
    return (
      <Fragment>
        <input
          onChange={this.onChange}
          onKeyDown={this.handleKeyUp}
          value={keyword} 
          className="search__input" 
          placeholder="Coffee, beer..." 
          name="search"
        />
        <div className="search__results">
          {
            stores.map((store, index) => (
              <SearchItem 
                key={store.slug} 
                item={store}
                isSelect={index === indexActive} 
              />
            ))
          }
        </div>
      </Fragment>
    );
  }
}

export default Search;
