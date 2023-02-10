import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

const dev = process.env.NODE_ENV === 'development'

const ReactComment = ({ children, devOnly = true,  }) => {
  if(!dev || !devOnly) return (<></>)

  const createComment = text => `<!-- ${text} -->`

  const ref = useRef()

  useEffect(() => {
    const el = ReactDOM.findDOMNode(ref.current)
    ReactDOM.unmountComponentAtNode(el)
    el.outerHTML = createComment(children)
  }, [])

  return (<div ref={ref}/>)
}

export default ReactComment
