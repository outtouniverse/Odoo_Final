import React from 'react'
import type { Suggestion } from './suggestions'

export default function DestinationsMap({ s }: { s: Suggestion }) {
  return (
    <article className="rounded-xl h-full border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      
      
        <div className="relative h-full w-full rounded-md bg-neutral-100 overflow-hidden">
          <iframe
            title="Paris Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.999349657322!2d2.292292615674839!3d48.8583730792877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fddf1f6b1b1%3A0x40b82c3688c9460!2sParis%2C%20France!5e0!3m2!1sen!2sus!4v1681234567890!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '160px', minWidth: '100%' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
   
    </article>
  )
}
