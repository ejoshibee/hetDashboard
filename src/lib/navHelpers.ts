import { NavigateFunction } from 'react-router-dom';

interface SendToMapParams {
  navigate: NavigateFunction;
  data: unknown;
  imei?: string | null;
  binLabel?: string;
}

export const handleSendToMap = ({ navigate, data, imei, binLabel }: SendToMapParams) => {
  if (!imei) {
    alert("Please select an IMEI to view");
    return;
  }

  navigate(`/map?imei=${imei}${binLabel ? `&bin=${encodeURIComponent(binLabel)}` : ''}`, { state: { mapData: data } });
};