import ErrorPage from './ErrorPage.jsx'

export default function TooManyRequests() {
  return <ErrorPage code="429" />
}
