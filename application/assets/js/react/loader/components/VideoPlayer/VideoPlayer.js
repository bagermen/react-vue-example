import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
import { Modal, Label } from 'react-bootstrap';
import * as Styles from './VideoPlayerModule.scss';
import moment from 'moment';

class VideoPlayer extends Component {
    static propTypes = {
        host: PropTypes.string.isRequired,
        ChosenBrandVideo: PropTypes.object.isRequired,
        showWin: PropTypes.bool.isRequired,
        onHide: PropTypes.func.isRequired
    }

    static defaultProps = {
        host: '/',
        onHide: () => {},
        showWin: false
    }

    render() {
        return (
            <Modal show={this.props.showWin}  bsSize="large">
              <Modal.Header  onHide={this.props.onHide} closeButton>
                <Modal.Title>Brand Video Detail</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <form>
                  <div className="row">
                    <div className="col-sm-6">
                      <Video className={Styles.VideoSize} autoPlay loop
                        controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
                        src={`${this.props.host}files/video/${this.props.ChosenBrandVideo.file_id}`}
                      >

                      </Video>
                    </div>
                    <div className="col-sm-6">
                      <div className={Styles.params}>
                        <p>Display Name:</p><p>{this.props.ChosenBrandVideo.dispName !== undefined ? this.props.ChosenBrandVideo.dispName : null}</p>
                        <p>File Desc:</p><p>{this.props.ChosenBrandVideo.description !== undefined ? this.props.ChosenBrandVideo.description : null}</p>
                        <p>Uploaded On:</p><p>{this.props.ChosenBrandVideo.createdAt !== undefined ? moment(this.props.ChosenBrandVideo.createdAt * 1000).format('MM-DD-YYYY') : null}</p>
                        <p>File Name:</p><p>{this.props.ChosenBrandVideo.fileName !== undefined ? this.props.ChosenBrandVideo.fileName : null}</p>
                        <p>Meta Data:</p><p>{this.props.ChosenBrandVideo.metaData !== undefined ? this.props.ChosenBrandVideo.metaData.metaData : null}</p>
                        <p>Tags:</p><p>{ this.props.ChosenBrandVideo.tags instanceof Array
                          ? this.props.ChosenBrandVideo.tags.map((tag) => {
                            return (<Label key={tag.id} bsStyle="default" className={Styles.labelsMargin}>{tag.name}</Label>)
                          })
                          : null}</p>
                      </div>
                    </div>
                  </div>
                  <Modal.Footer></Modal.Footer>
                </form>
              </Modal.Body>
            </Modal>
        )
    }
}

function mapStateToProps(state) {
  return {
      ChosenBrandVideo: state.BrandVideo.ChosenBrandVideo,
      host: state.Host
  };
}

export default connect(
  mapStateToProps,
)(VideoPlayer);