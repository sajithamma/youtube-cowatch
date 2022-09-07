import style from './logo.module.css';

function logo() {
  return (
  <div className={style.logo}>
  <img src="/logo-1.png" className={style.logoImage}/>
  </div>
  )
}

export default logo;