import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"


export default function InitialPage({ onSubmit }) {
  console.log('[InitialPage] Component rendering');
  
  const [isFading, setIsFading] = useState(false);     // starts false
  const [hide, setHide] = useState(false);             // controls scrolling
  const [opacity, setOpacity] = useState(90);          // starts at 90
  const [visible, setVisible] = useState(true);        // rendered initially
  const [currentUser, setCurrentUser] = useState("");

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
          console.log('[InitialPage] Fade complete, hiding component');
          clearInterval(interval);
          setVisible(false);  // remove from DOM
          return 0;
        }
        return prev - 5;       // fade step
      });
    }, 10);

    return () => clearInterval(interval);
  }, [isFading]);

  console.log('[InitialPage] Render state - visible:', visible, 'opacity:', opacity, 'isFading:', isFading);
  
  if (!visible) {
    console.log('[InitialPage] Not visible, returning null');
    return null;
  }

  return (
    <div>
      <div
        className={`
          fixed inset-0 z-30
          flex flex-col items-center justify-center
          transition-opacity duration-300 bg-cream min-h-[100dvh]
        `}
        style={{ backgroundColor: `rgba(255,247,230,${opacity/100})` }}
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
            <Input
              type="text"
              placeholder="Enter your name"
              className="mb-5 w-64 text-center"
              style={{ fontFamily: "var(--font-quicksand)" }}
              onChange={(e) => setCurrentUser(e.target.value)}
            />
            <Button
            className="active:opacity-80 active:bg-gray-200 transition-all"
            style={{ fontFamily: "var(--font-quicksand)" }}
            variant="outline"
            onClick={() => {setIsFading(true); setHide(true); onSubmit(currentUser);}}
            >
                Start Now
            </Button>
        </div>
      </div>
    </div>
  );
}
