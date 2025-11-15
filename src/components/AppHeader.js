
import styles from './styles/styles.module.css';

export default function AppHeader() {
  return (
    <div className="flex flex-row justify-between px-2 bg-white h-20">
        <span className="text-3xl font-serif text-softBrown mt-3"
        style={{fontFamily : "var(--font-quicksand)"}}
        >LifeLong</span>
        <img src="/tmp_logo.png" alt="LifeLong Logo" 
        className={`
        h-10 
        w-10 
        mt-3
        rounded-full
        border-1
        border-[#000000]
        ${styles.logo_border}
        `} 
        />
      
    </div>
  )
}
