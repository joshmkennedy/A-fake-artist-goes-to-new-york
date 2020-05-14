import Footer from 'src/components/footer'

import TestRoomCell from 'src/components/TestRoomCell'
import Header from 'src/components/Header'
const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <TestRoomCell id={1} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
export default MainLayout
