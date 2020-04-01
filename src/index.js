import React, { useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Tab, Grid, Form } from 'semantic-ui-react'
import { useSelector, useDispatch } from 'react-redux'
import { getContent } from '@plone/volto/actions'

const messages = defineMessages({
  valueForLang: {
    id: 'value_for_lang',
    defaultMessage: 'Value for language {lang}',
  },
})

const DefaultWidget = ({ id, value, onChange }) => <textarea id={id} value={value} onChange={onChange} />

const MultilingualWidget = (Widget = DefaultWidget) => ({ value, id, onChange, required, title, description }) => {
  const intl = useIntl()
  const content = useSelector(state => state.content?.subrequests?.languageControlpanel?.data)
  const dispatch = useDispatch()

  const cookieConsentConfig = JSON.parse(value)

  const handleChangeText = lang => e => {
    onChange(
      id,
      JSON.stringify({
        ...cookieConsentConfig,
        [lang]: e.target.value,
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
        <label htmlFor={`multilingual-text-${token}`}>
          {intl.formatMessage(messages.valueForLang, { lang: title })}
          <Widget
            id={`multilingual-text-${token}`}
            value={cookieConsentConfig[token] ?? ''}
            onChange={handleChangeText(token)}
          />
        </label>
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
            {content?.data?.available_languages && <Tab panes={tabPanes} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form.Field>
  )
}

export default MultilingualWidget
