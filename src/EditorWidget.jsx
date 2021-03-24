import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Editor from 'draft-js-plugins-editor'
import { convertToRaw, EditorState, RichUtils } from 'draft-js'
import isSoftNewlineEvent from 'draft-js/lib/isSoftNewlineEvent'
import createInlineToolbarPlugin from 'draft-js-inline-toolbar-plugin'
import { stateFromHTML } from 'draft-js-import-html'
import { stateToHTML } from 'draft-js-export-html'
import { isEqual } from 'lodash'
import config from '@plone/volto/registry';


/**
 * Text editor class.
 * @class EditorWidget
 * @extends Component
 */
class EditorWidget extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    id: PropTypes.string.isRequired,
  }

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs EditorWidget
   */
  constructor(props) {
    super(props)

    // eslint-disable-next-line no-undef
    if (__CLIENT__) {
      const inlineToolbarPlugin = createInlineToolbarPlugin({
        structure: config.settings.richTextEditorInlineToolbarButtons,
      })

      this.state = {
        editorState: this.createEditorState(props.value),
        inlineToolbarPlugin,
        addNewBlockOpened: false,
      }
    }
  }

  createEditorState = value => {
    let editorState
    if (value) {
      const contentState = stateFromHTML(value)
      editorState = EditorState.createWithContent(contentState)
    } else {
      editorState = EditorState.createEmpty()
    }

    return editorState
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      this.setState({ editorState: this.createEditorState(nextProps.value) })
    }
  }

  /**
   * Change handler
   * @method onChange
   * @param {object} editorState Editor state.
   * @returns {undefined}
   */
  onChangeText = editorState => {
    if (
      !isEqual(convertToRaw(editorState.getCurrentContent()), convertToRaw(this.state.editorState.getCurrentContent()))
    ) {
      this.props.onChange(stateToHTML(editorState.getCurrentContent()))
    }
    this.setState({ editorState })
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    // eslint-disable-next-line no-undef
    if (__SERVER__) {
      return <div />
    }

    const { InlineToolbar } = this.state.inlineToolbarPlugin
    return (
      <div className="multilingual-editor-widget" id={this.props.id}>
        <Editor
          id={this.props.id}
          onChange={this.onChangeText}
          editorState={this.state.editorState}
          plugins={[this.state.inlineToolbarPlugin, ...config.settings.richTextEditorPlugins]}
          blockRenderMap={this.props.blockRenderMap}
          blockStyleFn={config.settings.blockStyleFn}
          placeholder={this.props.placeholder}
          ref={node => {
            this.node = node
          }}
          handleReturn={e => {
            if (isSoftNewlineEvent(e)) {
              this.onChangeText(RichUtils.insertSoftNewline(this.state.editorState))
              return 'handled'
            }

            return {}
          }}
        />
        {<InlineToolbar />}
      </div>
    )
  }
}

export default EditorWidget
