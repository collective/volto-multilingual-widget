import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { compose } from 'redux';
import { injectIntl } from 'react-intl';

import loadable from '@loadable/component';

import { isEqual } from 'lodash';

import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import config from '@plone/volto/registry';

const Editor = loadable(() => import('draft-js-plugins-editor'));

/**
 * Text editor class.
 * @class EditorWidget
 * @extends Component
 */
class TextEditorWidgetComponent extends Component {
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
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs EditorWidget
   */
  constructor(props) {
    super(props);

    const { settings } = config;

    this.draftConfig = settings.richtextEditorSettings(props);

    const createInlineToolbarPlugin = props.draftJsInlineToolbarPlugin.default;

    // eslint-disable-next-line no-undef
    if (__CLIENT__) {
      const inlineToolbarPlugin = createInlineToolbarPlugin({
        structure: this.draftConfig.richTextEditorInlineToolbarButtons,
      });

      this.state = {
        editorState: this.createEditorState(props.value),
        inlineToolbarPlugin,
        addNewBlockOpened: false,
      };
    }
  }

  createEditorState = (value) => {
    const { EditorState } = this.props.draftJs;
    const { stateFromHTML } = this.props.draftJsImportHtml;
    let editorState;
    if (value) {
      const contentState = stateFromHTML(value);
      editorState = EditorState.createWithContent(contentState);
    } else {
      editorState = EditorState.createEmpty();
    }

    return editorState;
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      this.setState({ editorState: this.createEditorState(nextProps.value) });
    }
  }

  /**
   * Change handler
   * @method onChange
   * @param {object} editorState Editor state.
   * @returns {undefined}
   */
  onChangeText = (editorState) => {
    const { convertToRaw } = this.props.draftJs;
    const { stateToHTML } = this.props.draftJsExportHtml;
    if (
      !isEqual(
        convertToRaw(editorState.getCurrentContent()),
        convertToRaw(this.state.editorState.getCurrentContent()),
      )
    ) {
      this.props.onChange(stateToHTML(editorState.getCurrentContent()));
    }
    this.setState({ editorState });
  };

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    // eslint-disable-next-line no-undef
    if (__SERVER__) {
      return <div />;
    }

    const { InlineToolbar } = this.state.inlineToolbarPlugin;
    const isSoftNewlineEvent = this.props.draftJsLibIsSoftNewlineEvent.default;
    const { RichUtils } = this.props.draftJs;

    return (
      <div className="multilingual-editor-widget" id={this.props.id}>
        <Editor
          id={this.props.id}
          onChange={this.onChangeText}
          editorState={this.state.editorState}
          plugins={[
            this.state.inlineToolbarPlugin,
            ...this.draftConfig.richTextEditorPlugins,
          ]}
          blockRenderMap={this.draftConfig.extendedBlockRenderMap}
          blockStyleFn={this.draftConfig.blockStyleFn}
          customStyleMap={this.draftConfig.customStyleMap}
          placeholder={this.props.placeholder}
          ref={(node) => {
            this.node = node;
          }}
          handleReturn={(e) => {
            if (isSoftNewlineEvent(e)) {
              this.onChangeText(
                RichUtils.insertSoftNewline(this.state.editorState),
              );
              return 'handled';
            }

            return {};
          }}
        />
        {this.node && <InlineToolbar />}
      </div>
    );
  }
}

export const EditorWidget = compose(
  injectIntl,
  injectLazyLibs([
    'draftJs',
    'draftJsLibIsSoftNewlineEvent',
    'draftJsFilters',
    'draftJsInlineToolbarPlugin',
    'draftJsBlockBreakoutPlugin',
    'draftJsCreateInlineStyleButton',
    'draftJsCreateBlockStyleButton',
    'immutableLib',
    'draftJsImportHtml',
    'draftJsExportHtml',
    // TODO: add all plugin dependencies, also in Wysiwyg and Cell
  ]),
)(TextEditorWidgetComponent);

const Preloader = (props) => {
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    Editor.load().then(() => setLoaded(true));
  }, []);
  return loaded ? <EditorWidget {...props} /> : null;
};

export default Preloader;
