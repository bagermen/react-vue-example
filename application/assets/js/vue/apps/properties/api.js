import axios from 'axios'
import qs from 'qs'
import _ from 'lodash'
import bus from '@/Bus'

export default {
  getProperties() {
    // return list of properties
    return new Promise((resolve, reject) => {
        axios.get('commonList').then(({ data, status, statusText }) => {
          if (status == 200) {
            resolve(data);
          } else {
            bus.$emit('error_dialog', null, 'Error during getting parameters');
            reject(statusText);
          }
        }).catch((resp) => {
          bus.$emit('error_dialog', null, resp);
          reject(resp);
        });
    });
  },

  getValues(propertyId) {
    return new Promise((resolve, reject) => {
        axios.get('valuesList/' + propertyId).then(({ data, status, statusText }) => {
          if (status == 200) {
            resolve(data);
          } else {
            bus.$emit('error_dialog', null, 'Error during getting values');
            reject(statusText);
          }
        }).catch((resp) => {
          bus.$emit('error_dialog', null, resp);
          reject(resp);
        });
    });
  },

  saveValue(propertyId, value) {
    return new Promise((resolve, reject) => {
        axios.create({ headers: { 'X-Requested-With': 'XMLHttpRequest' } })
          .post('editValue/' + propertyId, qs.stringify(value)).then(({ data, status, statusText }) => {
            if (status == 200) {
              resolve(data);
            } else {
              bus.$emit('error_dialog', null, 'Error during saving value');
              reject(statusText);
            }
          }).catch((resp) => {
            bus.$emit('error_dialog', null, resp);
            reject(resp);
          });
      });
  },

  deleteValue(value) {
    let delPromise = new Promise((resolve, reject) => {
        let deleteValue = () => {
          axios.create({ headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .delete('deleteValue/' + value['id']).then(({ data, status, statusText }) => {
              if (status == 200) {
                resolve(data);
              } else {
                bus.$emit('error_dialog', null, 'Error during removing value');
                reject(statusText);
              }
            }).catch((resp) => {
              bus.$emit('error_dialog', null, resp);
              reject(resp);
            });

            return delPromise;
        };

        bus.$emit(
          'confirm_dialog',
          'Attention',
          'Are you sure want to delete selected value?',
          deleteValue,
          () => {
            reject();
          }
          );
      });

    return delPromise;
  }
}
