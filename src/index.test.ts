import { generateContract, generatePDF, sendContractToDocuSign } from './index';
import axios from 'axios';

// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// describe('generateContract', () => {
//   it('should generate contract text', () => {
//     const customer = { id:1 , name: 'John Doe', email: 'john.doe@example.com', phone: "8937874744", address: "sdf sdf sd"};
//     const contract = generateContract(customer);
//     expect(contract).toBe(`Dear John Doe,\n\nThis is your contract.\n\nRegards,\nCompany`);
//   });
// });

// describe('generatePDF', () => {
//   it('should generate a PDF buffer', async () => {
//     const content = 'This is a test contract';
//     const pdfBuffer = await generatePDF(content);
//     expect(pdfBuffer).toBeInstanceOf(Buffer);
//   });
// });

// describe('sendContractToDocuSign', () => {
//   it('should send the contract to DocuSign', async () => {
//     const pdfBuffer = Buffer.from('test pdf content');
//     mockedAxios.post.mockResolvedValue({ data: { envelopeId: '12345' } });

//     await sendContractToDocuSign('john.doe@example.com', pdfBuffer, '', '');

//     expect(mockedAxios.post).toHaveBeenCalled();
//   });
// });
