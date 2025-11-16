import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';


export default function InitialPage() {
  const [isFading, setIsFading] = useState(false);     // starts false
  const [hide, setHide] = useState(false);             // controls scrolling
  const [opacity, setOpacity] = useState(98);          // starts at 90
  const [visible, setVisible] = useState(true);        // rendered initially

  useEffect(() => {
  if (!hide) {
    // Disable scrolling
    document.body.style.overflow = "hidden";
  } else {
    // Re-enable scrolling
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [hide]);


  useEffect(() => {
    if (!isFading) return;

    const interval = setInterval(() => {
      setOpacity(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          setVisible(false);  // remove from DOM
          return 0;
        }
        return prev - 5;       // fade step
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isFading]);

  if (!visible) return null;

  return (
    <div>
      <div
        className={`
          fixed inset-0 z-30
          flex flex-col items-center justify-center
          transition-opacity duration-300 bg-white min-h-[100dvh]
        `}
        style={{ backgroundColor: `rgba(255,255,255,${opacity/100})` }}
      >
        <div className=' rounded-lg flex flex-col items-center justify-center p-2 mx-4'
          style={{backgroundColor: '#ffffff', opacity: `${opacity/100}`,  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.08)"}}
        >
            <h1
            className="text-4xl  font-serif text-center mt-10 mb-5 "
            style={{ fontFamily: "var(--font-quicksand)", fontWeight: 600 }}
            >
            Welcome to LifeLong
            </h1>

            <p
            className="text-center mx-10 mb-5"
            style={{ fontFamily: "var(--font-quicksand)", fontWeight: 500 }}
            >
            LifeLong is your personal journal that captures your memories through voice and images.
            </p>

            <Button
            className="active:opacity-80 active:bg-gray-200 transition-all"
            style={{ fontFamily: "var(--font-quicksand)" }}
            variant="outline"
            onClick={() => {setIsFading(true); setHide(true)}}
            >
                Start Now
            </Button>
        </div>
      </div>
    </div>
  );
}
