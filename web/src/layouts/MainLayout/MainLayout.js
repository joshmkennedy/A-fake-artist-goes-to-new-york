import Footer from 'src/components/footer'

import Header from 'src/components/Header'
const MainLayout = ({ children }) => {
  return (
    <>
      <Header />

      <main>{children}</main>
      <Footer />
    </>
  )
}
export default MainLayout
