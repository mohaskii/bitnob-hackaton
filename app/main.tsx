import { render } from 'preact'
import { App } from './App.tsx'

const root = document.getElementById('app')
if (!root) throw Error('unable to find root element #app')
render(<App />, root)
