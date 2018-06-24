// ./src/pages/new.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { arrayMove } from 'react-sortable-hoc';
import shortId from 'short-id';
import FileUploader from 'react-firebase-file-uploader';

import { Button } from '../styledComponents/theme';
import { Heading2 } from '../styledComponents/typography';
import NewPoll from '../components/NewPoll/index';

const CreateButton = Button.extend`
  background-image: linear-gradient(19deg, #21d4fd 0%, #b721ff 100%);
  margin-left: 20px;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const TitleContainer = styled.div`
  display: inline-flex;
  width: 350px;
  flex-direction: column;
  margin-bottom: 30px;
`;

const TitleLabel = styled.label`
  font-weight: bold;
`;

const TitleInput = styled.input`
  color: black;
  font-size: 18px;
`;

class NewPollPage extends Component {
  static contextTypes = {
    firebase: PropTypes.object,
  };

  static propTypes = {
    history: PropTypes.object.isRequired,
    uid: PropTypes.string,
    signIn: PropTypes.func.isRequired,
  };

  state = {
    title: '',
    options: [],
    avatar: '',
    loading: false,
    isUploading: false,
    progress: 0,
    avatarURL: '',
  };

  // to keep track of what item is being edited
  editing = null;

  handleKeydown = e => {
    if (e.which === 27) this.handleToggleEdit(this.editing);
    if (e.which === 13) this.handleAddItem();
  };

  handleToggleEdit = id => {
    this.setState(prevState => {
      const options = prevState.options
        .filter(({ text }) => text)
        .map(option => {
          if (option.id === id) {
            if (!option.editing) {
              this.editing = id;
            } else {
              this.editing = null;
            }

            return {
              ...option,
              editing: !option.editing,
            };
          }

          return {
            ...option,
            editing: false,
          };
        });

      return {
        ...prevState,
        options,
      };
    });
  };

  handleTitleChange = e => {
    const { value } = e.target;

    this.setState({
      title: value,
    });
  };

  handleTextChange = (e, id) => {
    const options = this.state.options.map(option => {
      if (option.id === id) {
        return {
          ...option,
          text: e.target.value,
        };
      }

      return option;
    });

    this.setState({
      ...this.state,
      options,
    });
  };

  handleImageChange = image => {
    const options = this.state.options.map(option => {
      return {
        ...option,
        image,
      };
    });

    this.setState({
      ...this.state,
      options,
    });
  };

  handleSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      ...this.state,
      options: arrayMove(this.state.options, oldIndex, newIndex),
    });
  };

  handleAddItem = () => {
    // if the user spams add w/o writing any text the items w/o any text get removed
    const options = this.state.options
      // filter out any falsy values from the list
      .filter(Boolean)
      .filter(({ text }) => !!text.trim())
      .map(option => ({
        ...option,
        editing: false,
      }));
    const id = shortId.generate();
    this.editing = id;

    this.setState({
      ...this.state,
      options: [
        ...options,
        {
          id,
          text: '',
          editing: true,
        },
      ],
    });
  };

  handleDelete = id => {
    const options = this.state.options.filter(option => option.id !== id);

    this.setState({
      ...this.state,
      options,
    });
  };

  handleCreate = () => {
    const pollId = shortId.generate();
    const { signIn, uid } = this.props;

    this.setState({
      loading: true,
    });

    if (!uid) {
      // due to our database rules, we can't write unless a uid exists
      signIn('anonymous').then(() => {
        this.createPoll(pollId);
      });
    } else {
      this.createPoll(pollId);
    }
  };

  createPoll(pollId) {
    const { firebase } = this.context;
    const { options, title, avatarURL, avatar } = this.state;
    const { history, uid } = this.props;
    firebase.polls
      .doc(pollId)
      .set({
        title,
        authorId: uid,
        id: pollId,
        imageUrl: avatarURL,
        imageFile: avatar,
        options: options.map(({ text, id }) => ({ text, optionId: id })),
      })
      .then(() => {
        this.setState({
          options: [],
          loading: false,
          title: '',
        });

        history.push(`/poll/${pollId}`);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      });
  }

  handleUploadStart = () => this.setState({ isUploading: true, progress: 0 });

  handleProgress = progress => this.setState({ progress });

  handleUploadError = error => {
    this.setState({ isUploading: false });
    console.error(error);
  };

  handleUploadSuccess = filename => {
    const { firebase } = this.context;
    this.setState({
      avatar: filename,
      progress: 100,
      isUploading: false,
    });
    this.handleImageChange(filename);
    console.log(this.state);
    firebase
      .storage()
      .ref('images')
      .child(filename)
      .getDownloadURL()
      .then(url => this.setState({ avatarURL: url }));
  };

  render() {
    const { firebase } = this.context;
    const {
      options,
      loading,
      title,
      isUploading,
      progress,
      avatarURL,
    } = this.state;
    const optionsWithText = options.filter(({ text }) => !!text.trim());
    const disableCreate = !title || optionsWithText.length < 2 || loading;

    return (
      <div>
        <Heading2>Create a new Poo</Heading2>
        <TitleContainer>
          <TitleLabel htmlFor="newPollTitle">Title</TitleLabel>
          <TitleInput
            id="newPollTitle"
            value={title}
            onChange={this.handleTitleChange}
          />
        </TitleContainer>
        {isUploading && <p>Progress: {progress}</p>}
        {avatarURL && <img src={avatarURL} alt="" />}

        <FileUploader
          accept="image/*"
          name="avatar"
          randomizeFilename
          storageRef={firebase.storage().ref('images')}
          onUploadStart={this.handleUploadStart}
          onUploadError={this.handleUploadError}
          onUploadSuccess={this.handleUploadSuccess}
          onProgress={this.handleProgress}
        />
        <NewPoll
          options={options}
          onToggleEdit={this.handleToggleEdit}
          onTextChange={this.handleTextChange}
          onKeyDown={this.handleKeydown}
          onSortEnd={this.handleSortEnd}
          onDelete={this.handleDelete}
        />
        <ActionContainer>
          <Button
            disabled={disableCreate}
            onClick={!disableCreate && this.handleCreate}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
          <CreateButton
            disabled={loading}
            onClick={!loading && this.handleAddItem}>
            Add
          </CreateButton>
        </ActionContainer>
      </div>
    );
  }
}

export default NewPollPage;
