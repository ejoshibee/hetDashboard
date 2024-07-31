import { NavigateFunction } from 'react-router-dom';

interface SendToMapParams {
  navigate: NavigateFunction;
  data: unknown;
  imei?: string | null;
  binLabel?: string;
  startDate?: number | null;
  endDate?: number | null;
}

export const handleSendToMap = ({ navigate, data, imei, binLabel, startDate, endDate }: SendToMapParams) => {
  let url = `/map?imei=${imei ? imei : ''}`;
  
  if (binLabel) {
    url += `&bin=${encodeURIComponent(binLabel)}`;
  }
  
  if (startDate) {
    url += `&startDate=${startDate}`;
  }
  
  if (endDate) {
    url += `&endDate=${endDate}`;
  }

  navigate(url, { state: { mapData: data } });
};