import { userStore } from "../store/userStore";

export const useToken = () => {
  const setToken = userStore((state) => state.setAccessToken);
  const token = userStore((state) => state.accessToken);

  return { setToken, token };
};
