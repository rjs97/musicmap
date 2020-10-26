// var xhr = new XMLHttpRequest()

function contextClickHandler (info, tab) {
  var suggestForm = document.createElement('form')
  suggestForm.target = 'SuggestForm'
  suggestForm.method = 'POST'
  suggestForm.action = 'http://localhost:8888/clipped'

  if (info.selectionText) {
    var textInput = document.createElement('input')
    textInput.type = 'text'
    textInput.name = 'selected'
    textInput.value = info.selectionText
    suggestForm.appendChild(textInput)
  }

  var titleInput = document.createElement('input')
  titleInput.type = 'text'
  titleInput.name = 'title'
  titleInput.value = tab.title
  suggestForm.appendChild(titleInput)

  var pageInput = document.createElement('input')
  pageInput.type = 'text'
  pageInput.name = 'page'
  pageInput.value = info.pageUrl
  suggestForm.appendChild(pageInput)

  var tagInput = document.createElement('input')
  tagInput.type = 'text'
  tagInput.name = 'tag'
  tagInput.value = 'quote'
  suggestForm.appendChild(tagInput)

  document.body.appendChild(suggestForm)
  suggestForm.submit()
}

function pageClickHandler (tab) {
  var suggestForm = document.createElement('form')
  suggestForm.target = 'SuggestForm'
  suggestForm.method = 'POST'
  suggestForm.action = 'http://localhost:8888/clipped'

  var titleInput = document.createElement('input')
  titleInput.type = 'text'
  titleInput.name = 'title'
  titleInput.value = tab.title
  suggestForm.appendChild(titleInput)

  var pageInput = document.createElement('input')
  pageInput.type = 'text'
  pageInput.name = 'page'
  pageInput.value = tab.url
  suggestForm.appendChild(pageInput)

  var tagInput = document.createElement('input')
  tagInput.type = 'text'
  tagInput.name = 'tag'
  tagInput.value = 'video'
  suggestForm.appendChild(tagInput)

  document.body.appendChild(suggestForm)
  suggestForm.submit()
}

chrome.contextMenus.onClicked.addListener(contextClickHandler)

chrome.pageAction.onClicked.addListener(pageClickHandler)

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    'title': 'MusicMap Clipper',
    'contexts': ['selection'],
    'id': 'musicmap'
  })
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: '.youtube.' }
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
})
