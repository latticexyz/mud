import { grpc } from "@improbable-eng/grpc-web";
// import { ECSRelayService } from "@latticexyz/services/protobuf/ts/ecs-relay/ecs-relay_pb_service";
export function createGRPCClient<T extends { [key: string]: unknown }>(grpcStub: T, url: string) {
  // const pushClient = grpc.client(ECSRelayService.PushStream, { host: url });
  async function unary(method: keyof T, message: Message) {
    const client = grpc.client(grpcStub[method], { host: url, request: message });
  }
}
