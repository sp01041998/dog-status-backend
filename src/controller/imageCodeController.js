const imageCode = require('../model/imageCodeModel');

exports.createImage = async (req, res) => {
    try {
        const { data = [] } = req?.body || {};
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ message: "Invalid or empty data array" });
        }
        const imageDocuments = data.map(item => {
            const { imageName, imageUrl, statusCode } = item;
            if (!imageName || !imageUrl || !statusCode) {
                throw new Error(`Missing required fields in item: ${JSON.stringify(item)}`);
            }
            return {
                imageName,
                imageUrl,
                statusCode
            };
        });

        const savedImages = await imageCode.insertMany(imageDocuments);
        return res.status(201).json({
            message: "Images created successfully",
            data: savedImages
        });

    } catch (error) {
        console.error("Error creating images:", error.message);
        res.status(500).json({
            message: "Failed to create images",
            error: error.message
        });
    }
};



exports.getAllImages = async (req, res) => {
    try {
        const images = await imageCode.find();
        if (!images || images.length === 0) {
            return res.status(404).send({
                status: false,
                message: 'No images found.'
            });
        }
        return res.status(200).send({
            status: true,
            data: images
        });
    } catch (error) {
        console.error('Error fetching images:', error.message);
        return res.status(500).send({
            status: false,
            message: 'Server error while fetching images.'
        });
    }
};