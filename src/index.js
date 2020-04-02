import React, { useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Tab, Grid, Form } from 'semantic-ui-react'
import { useSelector, useDispatch } from 'react-redux'
import { getContent } from '@plone/volto/actions'

import EditorWidget from './EditorWidget'

const messages = defineMessages({
  valueForLang: {
    id: 'value_for_lang',
    defaultMessage: 'Value for language {lang}',
  },
  placeholder: {
    id: 'multilingual_text_placeholder',
    defaultMessage: 'Type some text...',
  },
})

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
}

const MultilingualWidget = (Widget = EditorWidget) => ({ value, id, onChange, required, title, description }) => {
  const intl = useIntl()
  const content = useSelector(state => state.content?.subrequests?.languageControlpanel?.data)
  const dispatch = useDispatch()

  const cookieConsentConfig = JSON.parse(value)

  const handleChangeText = lang => value => {
    onChange(
      id,
      JSON.stringify({
        ...cookieConsentConfig,
        [lang]: value,
      }),
    )
  }

  useEffect(() => {
    dispatch(getContent('/@controlpanels/language', null, 'languageControlpanel'))
  }, [dispatch])

  const tabPanes = content?.data?.available_languages?.map(({ title, token }) => ({
    menuItem: title,
    render: () => (
      <Tab.Pane id="multilingual-item">
        <label htmlFor={`multilingual-text-${token}`} style={srOnlyStyles}>
          {intl.formatMessage(messages.valueForLang, { lang: title })}
        </label>
        <Widget
          id={`multilingual-text-${token}`}
          placeholder={intl.formatMessage(messages.placeholder)}
          value={cookieConsentConfig[token] ?? ''}
          onChange={handleChangeText(token)}
        />
      </Tab.Pane>
    ),
  }))

  return (
    <Form.Field inline required={required} id={id}>
      <Grid>
        <Grid.Row>
          <Grid.Column width="4">
            <div className="wrapper">
              <label htmlFor="multilingual-item">{title}</label>
            </div>
          </Grid.Column>
          <Grid.Column width="8" className="multilingual-widget">
            {content?.data?.available_languages && <Tab renderActiveOnly panes={tabPanes} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form.Field>
  )
}

export default MultilingualWidget
