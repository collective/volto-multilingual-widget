import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Tab, Grid, Form } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { getContent } from '@plone/volto/actions';

import { WysiwygWidget } from '@plone/volto/components';

const messages = defineMessages({
  valueForLang: {
    id: 'value_for_lang',
    defaultMessage: 'Value for language {lang}',
  },
  placeholder: {
    id: 'multilingual_text_placeholder',
    defaultMessage: 'Type some text...',
  },
});

const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
};

const MultilingualWidget = (Widget = WysiwygWidget, defaultValue = '') => ({
  value = defaultValue,
  id,
  onChange,
  required,
  title,
  description,
}) => {
  const intl = useIntl();
  const availableLanguages = useSelector(
    (state) =>
      state.content?.subrequests?.languageControlpanel?.data?.data
        ?.available_languages,
  );
  const dispatch = useDispatch();

  const valueObj = typeof value === 'string' ? JSON.parse(value) : value;

  const handleChangeLangValue = (lang) => (fid, v) => {
    onChange(
      id,
      JSON.stringify({
        ...valueObj,
        [lang]: v.data,
      }),
    );
  };

  useEffect(() => {
    dispatch(
      getContent('/@controlpanels/language', null, 'languageControlpanel'),
    );
  }, [dispatch]);

  const tabPanes = availableLanguages?.map(({ title, token }) => ({
    menuItem: title,
    render: () => (
      <Tab.Pane
        id={`multilingual-item-${token}-${id}`}
        key={`multilingual-item-${token}-${id}`}
      >
        <label
          htmlFor={`multilingual-text-${token}-${id}`}
          style={srOnlyStyles}
        >
          {intl.formatMessage(messages.valueForLang, { lang: title })}
        </label>

        <Widget
          id={`multilingual-text-${token}-${id}`}
          placeholder={intl.formatMessage(messages.placeholder)}
          value={
            Widget === WysiwygWidget
              ? { data: valueObj[token] ?? defaultValue }
              : valueObj[token] ?? defaultValue
          }
          title={title}
          description={description}
          onChange={handleChangeLangValue(token)}
          wrapped={false}
        />
      </Tab.Pane>
    ),
  }));

  return (
    <Form.Field inline required={required} id={id}>
      <Grid>
        <Grid.Row>
          <Grid.Column width="4">
            <div className="wrapper">
              <label htmlFor="multilingual-item">{title}</label>
            </div>
          </Grid.Column>
          <Grid.Column
            width="8"
            id="multilingual-item"
            className="multilingual-widget"
          >
            {availableLanguages && <Tab panes={tabPanes} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form.Field>
  );
};

export default MultilingualWidget;
