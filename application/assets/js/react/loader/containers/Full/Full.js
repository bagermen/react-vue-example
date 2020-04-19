import React, { Component } from 'react';

class Full extends Component {
  render() {
    return (
      <div className="app">
        <div className="app-body">
          <main className="main font-size-body">
            <div className="container-fluid">
              {this.props.children}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Full;
