import React, {PropTypes} from 'react'
import LoginStatus from './LoginStatus'
import Form from './Form'
import {detectLoginStatus} from '../../electron/ipc_render'
import * as DataUtils from '../helpers/client_data'

export default React.createClass({
  propTypes: {
    states: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  },

  resetSettings() {
    this.props.actions.settingsShow({name: ''})
  },

  handleGitHubLogout() {
    DataUtils.removeAccountByPlatform('github')
    this.props.actions.accountUpdate({
      platform: 'github',
      value: {
        username: '',
        password: ''
      }
    })
    this.props.actions.statusUpdate({
      platform: 'github',
      value: false
    })
  },

  saveGithubAccount(username, password, repo) {
    if (!username || !password || !repo) {
      App.alert('输入的帐号信息不完整')
      return
    }

    detectLoginStatus({
      github: {username, password}
    }).then(isLogin => {
      if (isLogin) {
        DataUtils.updateAccount('github', username, password, repo)
        this.props.actions.accountUpdate({
          platform: 'github',
          value: {
            username,
            password,
            repo
          }
        })

        this.props.actions.statusUpdate({
          platform: 'github',
          value: true
        })
      } else {
        App.alert('验证失败', 'error')
      }
    }).catch(err => {
      App.alert(err.message, 'error')
    })
  },

  render() {
    let githubExtends = {
      name: 'repo',
      type: 'text',
      label: '仓库名',
      placeholder: '请输入GitHub仓库(repo)名称',
      required: true,
      value: ''
    }

    return (
      <div>
        {this.props.states.status.github ? (
          <LoginStatus
            username={this.props.states.account.github.username}
            onLogout={this.handleGitHubLogout}
          />
        ) : <Form onSubmit={this.saveGithubAccount} extends={[githubExtends]} />}
      </div>
    )
  }
})