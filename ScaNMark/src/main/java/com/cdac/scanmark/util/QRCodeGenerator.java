package com.cdac.scanmark.util;


import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;

@Component
public class QRCodeGenerator {

    /**
     * Generates a QR code and returns it as a Base64 encoded string.
     *
     * @param content   The content to be encoded in the QR code.
     * @param width     The width of the QR code.
     * @param height    The height of the QR code.
     * @return A Base64 encoded string of the generated QR code.
     * @throws WriterException If QR code generation fails.
     * @throws IOException     If writing the QR code fails.
     */
    public String generateQRCode(String content, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

        byte[] qrCodeImage = outputStream.toByteArray();
        return Base64.encodeBase64String(qrCodeImage); // Convert QR code image to Base64
    }

    /**
     * Generates a QR code and saves it as a file.
     *
     * @param content   The content to be encoded in the QR code.
     * @param width     The width of the QR code.
     * @param height    The height of the QR code.
     * @param filePath  The file path where the QR code image will be saved.
     * @throws WriterException If QR code generation fails.
     * @throws IOException     If writing the QR code fails.
     */
    public void generateQRCodeToFile(String content, int width, int height, String filePath) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);

        Path path = FileSystems.getDefault().getPath(filePath);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);
    }
}
