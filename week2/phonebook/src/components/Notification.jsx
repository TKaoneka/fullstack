const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  const { message, type } = notification

  return (
    <div className={type === 'error' ? 'error' : 'success'}>
      {message}
    </div>
  )
}

export default Notification