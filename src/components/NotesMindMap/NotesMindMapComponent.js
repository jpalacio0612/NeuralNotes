import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MindMap, Node, Edge } from 'circular-mind-map-react';

import { VisNetworkHelper } from 'helpers/visNetworkHelper';
import noteStorage from 'storage/noteStorage';
import { NoteNameEditorComponent } from 'components/NoteNameEditor/NoteNameEditorComponent';
import { StyledNotesMindMap } from 'components/NotesMindMap/NotesMindMapStyles';
import { NoteDetailsContainer } from 'components/NoteDetails/NoteDetailsContainer';

export class NotesMindMapComponent extends Component {
  render() {
    const {
      selectedNote,
      showNoteNameEditor,
      isChangeParentModeActive,
      nodes,
      edges,
    } = this.props;

    return (
      <StyledNotesMindMap>
        {selectedNote && <NoteDetailsContainer />}
        <MindMap
          nodes={nodes.map(n => (
            <Node
              id={n.id}
              label={n.label}
              onClick={() => this.handleNodeClick(n)}
              onDoubleClick={() => this.doubleClickHandler(n)}
            />
          ))}
          edges={edges.map(e => (
            <Edge {...e} />
          ))}
        />
        {showNoteNameEditor && (
          <NoteNameEditorComponent
            note={selectedNote}
            onChange={this.handleNoteNameUpdate}
            onChangeParentClick={this.props.onChangeParentButtonClick}
            onDeleteClick={this.onDeleteClick}
            isChangeParentModeActive={isChangeParentModeActive}
          />
        )}
      </StyledNotesMindMap>
    );
  }

  handleNodeClick(targetNode) {
    this.props.onMindMapClick();
    console.log('node clicked', targetNode);
    const { selectedNote } = this.props;

    // if clicking on the current note, do nothing.
    if (targetNode.id === selectedNote.id) return;

    const nodes = this.props.nodes;

    const targetNote = nodes.find(note => note.id === targetNode.id);

    if (!targetNote) {
      throw new Error(
        "noteClickHandler(): couldn't find targetNode: ",
        targetNode,
      );
    }

    this.props.changeSelectedNote({
      note: targetNote,
      edges: this.props.edges,
    });
  }

  visNetworkClickHandler = event => {
    const { selectedNote } = this.props;
    const { edges } = this.props;
    const { isChangeParentModeActive } = this.props;

    if (VisNetworkHelper.clickedOnNote(event)) {
      let targetNoteId = VisNetworkHelper.getTargetNoteId(event);
      const targetNote = this.props.nodes.find(
        note => note.id === targetNoteId,
      );

      if (isChangeParentModeActive) {
        this.props.changeParentNote({
          noteId: selectedNote.id,
          currentParentId: edges.find(edge => edge.to === selectedNote.id).id,
          newParent: targetNote,
          edges,
        });
      } else {
        if (targetNote.id !== selectedNote.id) {
          this.props.changeSelectedNote({
            note: targetNote,
            edges: this.props.edges,
          });
        }
      }
    }
  };

  doubleClickHandler = targetNode => {
    const { nodes } = this.props;
    const targetNote = nodes.find(node => node.id === targetNode.id);
    this.props.createEmptyChild({ parent: targetNote });
  };

  visNetworkHoldHandler = event => {
    const { nodes } = this.props;
    if (VisNetworkHelper.clickedOnNote(event)) {
      let targetNoteId = VisNetworkHelper.getTargetNoteId(event);
      const targetNote = nodes.find(node => node.id === targetNoteId);
      this.editNote(targetNote);
    }
  };

  editNote(targetNote) {
    const { nodes } = this.props;
    const note = nodes.find(node => node.id === targetNote.id);

    if (note.name === noteStorage.APP_FOLDER_NAME || !note.isNote) {
      return;
    }

    this.props.editNote(note);
  }

  handleNoteNameUpdate = newName => {
    const note = this.props.selectedNote;
    this.props.updateNoteName({ note, newName });
  };

  onDeleteClick = () => {
    let note = this.props.selectedNote;
    this.props.deleteNote({ note });
  };
}

NotesMindMapComponent.propTypes = {
  selectedNote: PropTypes.object.isRequired,
  changeSelectedNote: PropTypes.func.isRequired,
  createEmptyChild: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
  isChangeParentModeActive: PropTypes.bool.isRequired,
  changeParentNote: PropTypes.func.isRequired,
  showNoteNameEditor: PropTypes.bool.isRequired,
  nodes: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
  onMindMapClick: PropTypes.func.isRequired,
  editNote: PropTypes.func.isRequired,
  updateNoteName: PropTypes.func.isRequired,
  onChangeParentButtonClick: PropTypes.func.isRequired,
};
