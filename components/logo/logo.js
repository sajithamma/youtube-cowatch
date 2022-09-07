import style from './logo.module.css';
import Image from 'next/image'


function logo() {
    return (
        <div className={style.logo}>
            <Image alt="logo" src="/logo-1.png" className={style.logoImage} />
        </div>
    )
}

export default logo;