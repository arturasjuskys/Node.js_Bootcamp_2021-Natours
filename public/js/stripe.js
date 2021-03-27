import axios from 'axios';
import { shoAlert, showAlert } from './alerts';

const stripe = Stripe(
    'pk_test_51IZGGkAr05hh05YA9Gyapeja8jZBe7VuRm8yq89SOwcD9S50H62LZaipeA6MtutJvi432lqsSraGmqbcKQcmVzlr001fPN4F9N'
);

export const bookTour = async (tourId) => {
    try {
        // 1. Get checkout session
        const session = await axios(
            `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);

        // 2. Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
