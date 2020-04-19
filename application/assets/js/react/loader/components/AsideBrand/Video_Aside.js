import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { DefaultPlayer as Video } from 'react-html5video';
import 'react-html5video/dist/styles.css';
// import Select from 'react-select';
import 'react-select/dist/react-select.css';
// import { Creatable } from 'react-select';
import { WithContext as ReactTags } from 'react-tag-input';
import 'react-tag-input/example/reactTags.css';
import axios from 'axios'

/**
 * Tags for video.. NOT USED!!!
 */
class Aside extends Component {
    constructor(props) {

        super(props);
        this.CloseToggle = this.CloseToggle.bind(this);
        this.state = {
            CloseView: 11,
            CloseViewLoad: 111,
        }
        this.state = {
            tags: [],
            updateFlag: 0
        }
        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.getTags = this.getTags.bind(this)
        this.getVideoKeywords = this.getVideoKeywords.bind(this);
        this.handleKeywordState = this.handleKeywordState.bind(this);
        this.handleUpdateFlag = this.handleUpdateFlag.bind(this);
    }
    handleDelete(i) {
        this.handleUpdateFlag()
        var tagId = this.state.tags[i].id
        var data = {
            "type": "delete",
            "args": {
                "table": "brand_videos_keywords",
                "where": { "id": tagId },
                "returning": ["id"]
            }
        }
        var config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.LoginAuthToken,
                'X-Hasura-User-Id': localStorage.LoginId,
                'X-Hasura-Role': localStorage.LoginRoles,
            },
            withCredentials: true
        };
        axios.post('', data, config)
            .then(function (response) {
                // console.log('TAG DELETED', response.data)
            })
            .catch(function (error) {
                // console.log('TAG DELETION ERROR', error)
            });

    }

    handleAddition(tag) {
        this.handleUpdateFlag()
        if (this.props.SelectedVideo) {
            var videoId = this.props.SelectedVideo.id
            var data = {
                "type": "insert",
                "args": {
                    "returning": ["id"],
                    "table": "brand_videos_keywords",
                    "objects": [{
                        "brand_videos_id": videoId,
                        "keyword": tag,
                        "created_at": new Date().toISOString(),
                        "created_by": parseInt(localStorage.LoginId, 10)
                    }]
                }
            }
            var config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.LoginAuthToken,
                    'X-Hasura-User-Id': localStorage.LoginId,
                    'X-Hasura-Role': localStorage.LoginRoles,
                },
                withCredentials: true
            };
            axios.post('', data, config)
                .then(function (response) {
                    // console.log('TAG ADDED', response.data)
                })
                .catch(function (error) {
                    // console.log('TAG ADDING ERROR', error)
                });
        }
    }

    CloseToggle(g) {
        this.setState({ CloseView: 12 });
        document.body.classList.toggle('aside-menu-hidden-small', true);
    }
    componentWillUnmount() {
        //alert('UNMOUNTED')
    }
    componentDidUpdate(prevProps, prevState) {

        if (this.props.SelectedVideo) {
            //When the component is updated with new video
            if (prevProps.SelectedVideo) {
                if (this.props.SelectedVideo.id !== prevProps.SelectedVideo.id) {
                    this.handleUpdateFlag();
                    //alert('VIDEO WITH NEW ID')
                    //this.props.Actions.AddBrandVideoTag(this.state)
                }
            }
            Object.assign(this.state, {
                SelectedVideo: this.props.SelectedVideo,
                Actions: this.props.Actions
            })
            //When the component is updated with the same video
            this.getVideoKeywords();
        }
    }

    //Handle update flag to change the value of flag
    handleUpdateFlag() {
        this.setState({ updateFlag: 0 })
    }

    //KEYWORD FETCHING API
    getVideoKeywords() {
        if (this.props.SelectedVideo && this.state.updateFlag === 0) {
            var videoId = this.props.SelectedVideo.id;
            var data = { 'type': 'select', 'args': { 'table': 'brand_videos_keywords', 'columns': ['*'], 'where': { "brand_videos_id": videoId } }, };
            var config = {
                headers: {
                    'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.LoginAuthToken,
                    'X-Hasura-User-Id': localStorage.LoginId, 'X-Hasura-Role': localStorage.LoginRoles,
                },
                withCredentials: true
            };
            var self = this
            axios.post('', data, config)
                .then(function (response) {
                    self.getTags(response.data)
                })
                .catch(function (error) { console.error('ERROR', error) });

        }
    }

    //ASSIGNING STATE OF THE SET
    getTags(data) {
        var videoKeywords = [];
        if (data) {
            videoKeywords = data.reduce((videoKeywords, tag) => {
                return [...videoKeywords, { id: tag.id, text: tag.keyword }]
            }, videoKeywords)
        }
        //Setting the state of the video keywords to tags in here.
        this.handleKeywordState(videoKeywords)
    }

    handleKeywordState(data) {
        this.setState({ tags: data })
        this.setState({ updateFlag: 1 })
    }

    render() {

        if (this.state.CloseView === 12) {
            Object.assign(this.state,
                {
                    CloseViewLoad: 112,
                    CloseView: 11,
                }
            );
        }
        else {
            Object.assign(this.state,
                {
                    CloseViewLoad: 111,
                }
            );
        }

        // var options = [
        //     { value: 'one', label: 'One' },
        //     { value: 'two', label: 'Two' }
        // ];
        // this.setState({ CloseView: 11 });

        return (

            <div>

                <aside className="aside-menu-small White_Block_Whole_Dealer">
                    {
                        this.props.SelectedVideo ?
                            <div className="White_Block_Left_Brand_Video">
                                <div className="row">

                                    <div className="col-md-3">
                                        {/*<img src='img/avatars/1.jpg' className="IconSizeUser" />*/}
                                    </div>
                                    <div className="col-md-2">
                                        {/*<b> ew</b>*/}

                                    </div>

                                    <div className="col-md-2 ">

                                        {/*<button className="btn" type="button" onClick={this.toggle}  >&nbsp; Edit</button>*/}
                                    </div>

                                    <div className="col-md-2">
                                        {/*<label className="switch switch-3d switch-primary float_left SwitchToggle" >
                  <input type="checkbox"  onChange={this.SwitchChange} className="switch-input"  />
                  <span className="switch-label"></span>
                  <span className="switch-handle"></span>
                </label>*/}
                                        {/*<button className="btn btn-danger" type="button">  Upload</button>*/}

                                    </div>
                                    <div className="col-md-2">



                                    </div>

                                    <div className="col-md-1">
                                        <img src='img/close.png' alt="Close" onClick={this.CloseToggle} className="CloseButton" />
                                    </div>




                                    <div className=" ">
                                        <div className="Font_Size_Video">   {this.props.SelectedVideo.file_name} </div>
                                        {/*<div> <b className=" padding-10"> File Type:</b> 1234 </div>
                                        <div><b className=" padding-10">  File Name:</b> 1234 </div>
                                        <div><b className=" padding-10"> File Size:</b> 1234 </div>*/}
                                    </div>
                                    <br />


                                    <div className="well padding-10">

                                        {/* {this.state.CloseViewLoad == 111 ?
                                            <Video className="VideoSize" autoPlay loop muted
                                                controls={['PlayPause', 'Seek', 'Time', 'Volume', 'Fullscreen']}
                                                src={"https://s3-us-east-2.amazonaws.com/cltv-adn/" + this.props.SelectedVideo.path}
                                            >


                                            </Video>

                                            : null} */}

                                    </div>
                                    <div className='col-md-12'>
                                        <h5>Keywords:</h5>
                                        <ReactTags
                                            classNames={{
                                                tags: 'tagsClass',
                                                tag: 'tagClass',
                                                tagInput: 'tagInputClass',
                                                tagInputField: 'tagInputFieldClass',
                                                remove: 'removeClass'
                                            }}
                                            tags={this.state.tags}
                                            placeholder={"Add Tag"}
                                            handleDelete={this.handleDelete}
                                            handleAddition={this.handleAddition} />
                                    </div>
                                </div>
                            </div>
                            : null}

                </aside >
            </div >
        )
    }
}

export default Aside;
