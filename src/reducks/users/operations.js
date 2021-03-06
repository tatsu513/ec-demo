import {
  signInAction,
  signOutAction,
  fetchProductInCartAction,
  fetchOrdersHistoruAction,
  fetchProductInLikeAction
} from './actions'
import { push } from 'connected-react-router'
import { auth, db, FirebaseTimestamp } from '../../firebase/index'

export const addProductToCart = (addedPropduct) => {
  return async (dispatch, getState) => {
    const uid = getState().users.uid
    const cartRef = db.collection('users').doc(uid).collection('cart').doc()
    addedPropduct['cartId'] = cartRef.id
    await cartRef.set(addedPropduct)
  }
}

export const fetchProductInCart = (products) => {
  return async (dispatch) => {
    dispatch(fetchProductInCartAction(products))
  }
}

export const addProductToLike = (addedPropduct) => {
  return async (dispatch, getState) => {
    const uid = getState().users.uid
    const likeRef = db.collection('users').doc(uid).collection('like').doc()
    addedPropduct['likeId'] = likeRef.id
    await likeRef.set(addedPropduct)
  }
}

export const fetchProductInLike = (products) => {
  return async (dispatch) => {
    dispatch(fetchProductInLikeAction(products))
  }
}

export const fetchOrdersHistory = () => {
  return async (dispatch, getState) => {
    const uid = getState().users.uid
    const list = []

    db.collection('users').doc(uid)
      .collection('orders')
      .orderBy('update_at', 'desc')
      .get()
      .then((snapshots) => {
        snapshots.forEach((snapshot) => {
          const data = snapshot.data()
          list.push(data)
        })
        dispatch(fetchOrdersHistoruAction(list))
      })
  }
}

export const listenAuthState = () => {
  return async (dispatch) => {
    auth.onAuthStateChanged(user => {
      if (user) {
        const uid = user.uid
          db.collection('users').doc(uid).get().then((snapshot) => {
            const data = snapshot.data()
            dispatch(signInAction({
              customer_id: data.customer_id
                ? data.customer_id
                : '',
              payment_method_id: data.payment_method_id
                ? data.payment_method_id
                : '',
              email: data.email,
              isSignedIn: true,
              role: data.role,
              uid: uid,
              username: data.username
            }))
          })
      } else {
        dispatch(push('/signin'))
      }
    })
  }
}

export const signIn = (email, password) => {
  return async (dispatch) => {
    if (email === '' || password === '') {
      alert('??????????????????????????????')
      return false
    }
    auth.signInWithEmailAndPassword(email, password)
      .then(result => {
        const user = result.user
        if (user) {
          const uid = user.uid
          db.collection('users').doc(uid).get().then((snapshot) => {
            const data = snapshot.data()
            dispatch(signInAction({
              customer_id: data.customer_id
                ? data.customer_id
                : '',
              payment_method_id: data.payment_method_id
                ? data.payment_method_id
                : '',
              email: data.email,
              isSignedIn: true,
              role: data.role,
              uid: uid,
              username: data.username
            }))
            dispatch(push('/'))
          })
        }
      })
      .catch(() => alert('?????????'))
  }
}

export const signUp = (
  username,
  email,
  password,
  confirmPassword
) => {
  return async (dispatch) => {
    if (
      username === '' ||
      email === '' ||
      password === '' ||
      confirmPassword === ''
    ) {
      alert('??????????????????????????????')
      return false
    }
    if (password !== confirmPassword) {
      alert('????????????????????????????????????')
      return false
    }
    return auth.createUserWithEmailAndPassword(email, password).then(
      result => {
        const user = result.user

        if(user) {
          const uid = user.uid
          const timestamp = FirebaseTimestamp.now()

          const initialData = {
            created_at: timestamp,
            email: email,
            role: 'cusotmer',
            uid: uid,
            update_at: timestamp,
            username: username
          }

          db.collection('users').doc(uid).set(initialData).then(() => {
            dispatch(push('/'))
          })
        }
      }
    )
  }
}

export const signOut = () => {
  return async (dispatch) => {
    auth.signOut().then(() => {
      dispatch(signOutAction())
      dispatch(push('/signin'))
    })
  }
}

export const restPassword = (email) => {
  return async (dispatch) => {
    if (email === '') {
      alert('??????????????????????????????')
      return false
    } else {
      auth.sendPasswordResetEmail(email)
      .then(() => {
        alert('???????????????????????????????????????????????????????????????????????????????????????')
        dispatch(push('/signin'))
      })
      .catch(() => alert('??????????????????'))
    }
  }
}