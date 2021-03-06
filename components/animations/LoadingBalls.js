import Loading from '../../views/Loading'


export default function LoadingBalls() {

  return (
    <Loading
        type={Loading.TYPES.ballTrinagle}
        color="#fea136"
        height={50}
        width={50}
        visible={true}
    />
  )
}