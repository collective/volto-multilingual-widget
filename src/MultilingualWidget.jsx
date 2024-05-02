import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Grid, Form } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { getContent } from '@plone/volto/actions';
import { Tabs } from '@plone/components'
import { Tab, TabList, TabPanel } from 'react-aria-components';
import config from '@plone/volto/registry';

import '@plone/components/src/styles/basic/Tabs.css';

const messages = defineMessages({
  valueForLang: {
    id: 'value_for_lang',
    defaultMessage: 'Value for language {lang}',
  },
  placeholder: {
    id: 'multilingual_text_placeholder',
    defaultMessage: 'Type some text...',
  },
  languages:{
    id: 'multilingual_languages',
    defaultMessage: 'Languages',
  },
});

const MultilingualWidget =
  (Widget, defaultValue = '') =>
  ({ value = defaultValue, id, onChange, required, title, description }) => {
    const editor = !!config.settings.slate ? 'slate' : 'draftjs';
    const DefaultWidget = config.widgets.widget.richtext;

    const WidgetComponent = Widget ?? DefaultWidget;

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
          [lang]:
            WidgetComponent === DefaultWidget && editor == 'draftjs'
              ? v.data
              : v,
        }),
      );
    };

    useEffect(() => {
      dispatch(
        getContent('/@controlpanels/language', null, 'languageControlpanel'),
      );
    }, [dispatch]);

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
              {availableLanguages &&
                <Tabs>
                  <TabList aria-label={intl.formatMessage(messages.languages)}>
                    {availableLanguages?.map(({ title, token }) =>{
                        const label = intl.formatMessage(messages.valueForLang, { lang: title });
                        return <Tab id={`multilingual-item-${token}-${id}`} aria-label={label}>{title}</Tab>
                      }
                    )}
                  </TabList>
                  {availableLanguages?.map(({ title, token }) =>
                      <TabPanel id={`multilingual-item-${token}-${id}`}>
                          <WidgetComponent
                            id={`multilingual-text-${token}-${id}`}
                            placeholder={intl.formatMessage(messages.placeholder)}
                            value={
                              WidgetComponent === DefaultWidget && editor == 'draftjs'
                                ? { data: valueObj[token] ?? defaultValue }
                                : valueObj[token] ?? defaultValue
                            }
                            title={title}
                            description={description}
                            onChange={handleChangeLangValue(token)}
                            wrapped={false}
                          />
                      </TabPanel>
                    )}
                </Tabs>}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form.Field>
    );
  };

export default MultilingualWidget;
